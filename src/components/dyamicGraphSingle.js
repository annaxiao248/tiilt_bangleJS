import dynamic from 'next/dynamic';

const DynamicGraphSingle = dynamic(() => import('./uploadedGraph').then(mod => mod.default), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

export default DynamicGraphSingle;