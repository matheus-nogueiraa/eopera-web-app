export default async function httpRequest(path, options) {
  const url = `${import.meta.env.VITE_API_BASE_URL}${path}`;

  const response = await fetch(url, options);
  return response;
}

