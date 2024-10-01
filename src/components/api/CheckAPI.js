import axios from "axios";

const API_URLS = ["http://103.209.33.79:55555", "http://172.16.0.53:8080"];

export const CheckAPI1 = async (endpoint, method = "GET") => {
  const axiosConfig = {
    method,
  };

  for (let i = 0; i < API_URLS.length; i++) {
    try {
      const response = await axios({
        ...axiosConfig,
        url: `${API_URLS[i]}${endpoint}`,
      });

      return response;
    } catch (error) {
      console.log(`Lỗi khi gọi API ${API_URLS[i]}:`, error.message);
      if (i === API_URLS.length - 1) {
        // Nếu đây là API cuối cùng trong danh sách, ném lỗi
        throw error;
      }
      // Nếu không phải API cuối cùng, tiếp tục vòng lặp để thử API tiếp theo
    }
  }
};

export const CheckAPI2 = async (endpoint, method = "GET") => {
  const axiosConfig = {
    method,
  };

  for (let i = 0; i < API_URLS.length; i++) {
    try {
      const response = await axios({
        ...axiosConfig,
        url: `${API_URLS[i]}${endpoint}`,
      });

      return response;
    } catch (error) {
      console.log(`Lỗi khi gọi API ${API_URLS[i]}:`, error.message);
      if (i === API_URLS.length - 1) {
        // Nếu đây là API cuối cùng trong danh sách, ném lỗi
        throw error;
      }
      // Nếu không phải API cuối cùng, tiếp tục vòng lặp để thử API tiếp theo
    }
  }
};

export const CheckAPI3 = async (endpoint, method = "GET") => {
  const axiosConfig = {
    method,
  };

  for (let i = 0; i < API_URLS.length; i++) {
    try {
      const response = await axios({
        ...axiosConfig,
        url: `${API_URLS[i]}${endpoint}`,
      });

      return response;
    } catch (error) {
      console.log(`Lỗi khi gọi API ${API_URLS[i]}:`, error.message);
      if (i === API_URLS.length - 1) {
        // Nếu đây là API cuối cùng trong danh sách, ném lỗi
        throw error;
      }
      // Nếu không phải API cuối cùng, tiếp tục vòng lặp để thử API tiếp theo
    }
  }
};
