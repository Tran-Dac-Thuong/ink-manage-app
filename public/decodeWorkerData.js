onmessage = (e) => {
  const result = decodeToObject(e.data);
  postMessage(result);
};

function decodeToObject(token) {
  // return JSON.parse(decodeURIComponent(atob(encodedString)));
  try {
    // Giải mã chuỗi Base64
    const decodedString = atob(token);
    // Giải mã URL
    const decodedURIComponent = decodeURIComponent(decodedString);
    // Parse chuỗi JSON thành object
    const obj = JSON.parse(decodedURIComponent);

    return obj;
  } catch (error) {
    console.error("Lỗi khi giải mã chuỗi:", error);
    return null;
  }
}
