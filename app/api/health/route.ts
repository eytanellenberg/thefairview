export async function GET() {
  return Response.json({
    status: 'healthy',
    service: 'TheFairView RAI/PAI API',
    timestamp: new Date().toISOString()
  });
}
