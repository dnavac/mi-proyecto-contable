import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import Link from 'next/link';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

// Esta función corre solo en el servidor cuando compilas la app
export const getStaticProps: GetStaticProps = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'pages/api', // Busca los comentarios JSDoc en toda esta carpeta
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API - Sistema Contable',
        version: '1.0.0',
        description: 'Documentación técnica generada automáticamente a partir del código.',
      },
    },
  });

  return {
    props: {
      spec,
    },
  };
};

export default function DocsPage({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="bg-white text-slate-900 px-2 py-0.5 rounded text-sm">API</span>
          Documentación
        </h1>
        <Link href="/" className="text-sm hover:underline">
          ← Volver
        </Link>
      </div>
      <div className="max-w-5xl mx-auto mt-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-12">
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}