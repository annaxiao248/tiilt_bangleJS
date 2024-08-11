import dynamic from 'next/dynamic';

const DynamicGraph = dynamic(() => import('./graphFetch'), {
  ssr: false
});

export default DynamicGraph;
