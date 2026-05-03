export const GET = () => {
  return new Response(JSON.stringify({ mensaje: "¡Hola! La API funciona." }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
