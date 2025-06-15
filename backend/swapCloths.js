const axios = require('axios');
const fs = require('fs');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');
const path = require('path');
const { URLSearchParams } = require('url');
const cloudinary = require('./utils/cloudinary.js');

const settings = {
  TEMP_IMAGE_DIR: path.join(__dirname, 'temp_images'),
  BASE_URL: process.env.BASE_URL,  
};

async function swap_cloths_image_to_image(input_image, cloth_image, cloth_type) {
  const server_address = settings.BASE_URL;
  const client_id = uuidv4();

  async function upload_image(image_path) {
    const form = new FormData();
    form.append('image', fs.createReadStream(image_path));

    try {
      const response = await axios.post(`${server_address}/upload/image`, form, {
        headers: form.getHeaders(),
      });
      if (response.status === 200) {
        console.log('Image uploaded successfully:', response.data);
        return response.data.name; 
      }
      return null;
    } catch (error) {
      console.error('Failed to upload image.', error.response?.status, error.response?.data);
      return null;
    }
  }

  async function queue_prompt(prompt) {
    const payload = JSON.stringify({ prompt, client_id });
    const res = await fetch(`${server_address}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    return await res.json();
  }

  async function get_image(filename, subfolder, folder_type) {
    const query = new URLSearchParams({ filename, subfolder, type: folder_type }).toString();
    const res = await fetch(`${server_address}/view?${query}`);
    return await res.arrayBuffer();
  }

  async function get_history(prompt_id) {
    const res = await fetch(`${server_address}/history/${prompt_id}`);
    return await res.json();
  }

  async function get_images(ws, prompt) {
    const { prompt_id } = await queue_prompt(prompt);
    return new Promise((resolve, reject) => {
      const output_images = {};

      ws.on('message', async (msg) => {
        try {
          const message = JSON.parse(msg.toString());
          if (message.type === 'executing') {
            if (message.data.node === null && message.data.prompt_id === prompt_id) {
              const history = await get_history(prompt_id);
              const outputs = history[prompt_id].outputs;

              for (const node_id in outputs) {
                const node_output = outputs[node_id];
                const images_output = [];

                if (node_output.images) {
                  for (const image of node_output.images) {
                    const imageData = await get_image(image.filename, image.subfolder, image.type);
                    images_output.push(Buffer.from(imageData));
                  }
                }

                output_images[node_id] = images_output;
              }

              resolve(output_images);
              ws.close();
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      });

      ws.on('error', (err) => {
        reject(err);
      });
    });
  }

  const input_image_filename = await upload_image(input_image);
  const cloth_image_filename = await upload_image(cloth_image);

  if (!input_image_filename || !cloth_image_filename) {
    console.error('Error: Failed to upload images.');
    return {
      output: ['Failed to upload input images.'],
      payload: { cloth_type },
    };
  }

  const prompt = {
    "10": {
      "inputs": { "image": input_image_filename, "upload": "image" },
      "class_type": "LoadImage", "_meta": { "title": "Target Person" }
    },
    "11": {
      "inputs": { "image": cloth_image_filename, "upload": "image" },
      "class_type": "LoadImage", "_meta": { "title": "Reference Garment" }
    },
    "12": {
      "inputs": { "catvton_path": "zhengchong/CatVTON" },
      "class_type": "LoadAutoMasker", "_meta": { "title": "Load AutoMask Generator" }
    },
    "13": {
      "inputs": {
        "cloth_type": cloth_type,
        "pipe": ["12", 0],
        "target_image": ["10", 0]
      },
      "class_type": "AutoMasker", "_meta": { "title": "Auto Mask Generation" }
    },
    "14": {
      "inputs": { "images": ["13", 1] },
      "class_type": "PreviewImage", "_meta": { "title": "Masked Target" }
    },
    "15": {
      "inputs": { "images": ["13", 0] },
      "class_type": "PreviewImage", "_meta": { "title": "Binary Mask" }
    },
    "16": {
      "inputs": {
        "seed": 42, "steps": 60, "cfg": 2.5,
        "pipe": ["17", 0],
        "target_image": ["10", 0],
        "refer_image": ["11", 0],
        "mask_image": ["13", 0]
      },
      "class_type": "CatVTON", "_meta": { "title": "TryOn by CatVTON" }
    },
    "17": {
      "inputs": {
        "sd15_inpaint_path": "runwayml/stable-diffusion-inpainting",
        "catvton_path": "zhengchong/CatVTON",
        "mixed_precision": "bf16"
      },
      "class_type": "LoadCatVTONPipeline", "_meta": { "title": "Load CatVTON Pipeline" }
    },
    "18": {
      "inputs": { "images": ["16", 0] },
      "class_type": "PreviewImage", "_meta": { "title": "Preview Image" }
    },
    "24": {
      "inputs": {
        "filename_prefix": "ComfyUI",
        "images": ["16", 0]
      },
      "class_type": "SaveImage", "_meta": { "title": "Save Image" }
    }
  };

  const ws = new WebSocket(`ws://${process.env.only_address}/ws?clientId=${client_id}`);

  let images;
  try {
    images = await get_images(ws, prompt);
  } catch (err) {
    console.error('WebSocket error or prompt processing failed:', err);
    return {
      output: ['Failed to generate images.'],
      payload: { cloth_type },
    };
  }

  const unique_filename = `${uuidv4().replace(/-/g, '')}_internal_cloth_swap.jpg`;
  const output_images = images['24'] || [];

  if (output_images.length === 0) {
    console.warn('No output image found from node 24.');
    return {
      output: ['No image generated.'],
      payload: { cloth_type },
    };
  }

  const sub_dir = 'output-images';
  const save_dir = path.join(settings.TEMP_IMAGE_DIR, sub_dir);
  fs.mkdirSync(save_dir, { recursive: true });

  const output_image_save_path = path.join(save_dir, unique_filename);
  fs.writeFileSync(output_image_save_path, output_images[0]);

  async function uploadToCloudinary(localFilePath) {
    try {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: 'virtual-outfit/output',
      });
      return result.secure_url;
    } catch (err) {
      console.error('Cloudinary upload failed:', err);
      throw err;
    }
  }

  let cloudinaryUrl = null;
  try {
    cloudinaryUrl = await uploadToCloudinary(output_image_save_path);
    console.log('Uploaded to Cloudinary:', cloudinaryUrl);
  } catch {
    console.error('Failed to upload output image to Cloudinary');
  }

  return {
    output: [cloudinaryUrl || 'No image generated.'],
    payload: { cloth_type },
  };
}

module.exports = { swap_cloths_image_to_image };