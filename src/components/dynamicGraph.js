import dynamic from 'next/dynamic';

const DynamicGraph = dynamic(() => import('./graph'), {
  ssr: false
});

export default DynamicGraph;
