import { useParams } from 'react-router-dom';

function Project() {
  const params = useParams();

  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Project {params.id}
      </h1>
    </div>
  );
}

export { Project };
