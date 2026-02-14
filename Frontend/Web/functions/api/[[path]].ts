export const onRequest: PagesFunction<{ BACKEND: string }> = async (context) => {
  const url = new URL(context.request.url);
  const backendPath = url.pathname.replace('/api', '');
  const destination = `${context.env.BACKEND}${backendPath}${url.search}`;

  // Создаем копию заголовков, чтобы изменить их
  const newHeaders = new Headers(context.request.headers);

  // Убираем хост Cloudflare, чтобы бэкенд не путался
  newHeaders.delete("host");

  return fetch(destination, {
    method: context.request.method,
    headers: newHeaders, // Используем очищенные заголовки
    body: context.request.body,
  });
};