import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const theme = searchParams.get('theme') || 'dark'; // 'dark' or 'light'

  // Determina la ruta base exactamente dentro del directorio frontend
  const reportsDir = path.join(process.cwd(), 'data/reports');
  
  // Mapear el tipo solicitado al archivo real dinámicamente
  const fileMap: Record<string, string> = {
    'eda_original': path.join(reportsDir, 'eda_dataset_videos_original.html'),
    'eda_recortados': path.join(reportsDir, 'eda_dataset_videos_recortados.html'),
    'compare': path.join(reportsDir, 'compare_experiments_report.html'),
    'best_model': path.join(reportsDir, 'best_model_report.html'),
  };

  if (!type || !fileMap[type]) {
    return new NextResponse('Report not found', { status: 404 });
  }

  const filePath = fileMap[type];
  
  try {
    let html = fs.readFileSync(filePath, 'utf-8');

    // Quitar el toggle de tema del propio informe para que no entre en conflicto con la UI del dashboard
    html = html.replace(/<div class='theme-toggle'>[\s\S]*?<\/div>\s*<\/div>/, '');
    html = html.replace(/<div class="theme-toggle">[\s\S]*?<\/div>\s*<\/div>/, '');

    // Fuerza el tema basado en el parámetro de consulta
    if (theme === 'dark') {
      html = html.replace(/<html lang=['"]es['"]>/, "<html lang='es' class='dark-mode'>");
    } else {
      // Elimina la clase dark-mode por defecto si existe
      html = html.replace(/<html lang=['"]es['"] class=['"]dark-mode['"]>/, "<html lang='es'>");
    }

    // Esconde el toggle de tema del informe usando inyección de CSS para simplemente sobrescribirlo
    const styleInject = `
    <style>
      .theme-toggle { display: none !important; }
      body { margin: 0; padding: 0; }
      .container { max-width: 100%; margin: 0; padding: 20px; box-shadow: none; border-radius: 0; }
    </style>
    <script>
      // Listen for theme changes from parent Next.js app
      window.addEventListener('message', (event) => {
        if (event.data === 'theme-dark') {
          document.documentElement.classList.add('dark-mode');
        } else if (event.data === 'theme-light') {
          document.documentElement.classList.remove('dark-mode');
        }
      });
    </script>
    `;
    
    html = html.replace('</head>', `${styleInject}</head>`);

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse('Error reading report file.', { status: 500 });
  }
}
