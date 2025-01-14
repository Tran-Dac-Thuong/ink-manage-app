onmessage = (e) => {
  const result = encodeObject(e.data);
  postMessage(result);
  // console.log(result);
};

function encodeObject(obj) {
  // return btoa(encodeURIComponent(JSON.stringify(obj)));
  try {
    // Chuyển object thành chuỗi JSON
    const jsonString = JSON.stringify(obj);
    // Mã hóa URL các ký tự đặc biệt
    const encodedURIComponent = encodeURIComponent(jsonString);
    // Mã hóa chuỗi thành Base64
    const encodedString = btoa(encodedURIComponent);

    return encodedString;
  } catch (error) {
    console.error("Lỗi khi mã hóa object:", error);
    return null;
  }
}
