interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  url?: string;
}

export default function ProjectCard({
  title,
  description,
  tags,
  url,
}: ProjectCardProps) {
  return (
    <div className="border-3 border-base-content rounded-none p-5 card-hover-grid hover:text-primary-content hover:border-primary group">
      <h3 className="text-lg font-black uppercase tracking-wide">{title}</h3>
      <p className="text-sm mt-2 opacity-70 group-hover:opacity-90">
        {description}
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-bold uppercase tracking-wider opacity-50 group-hover:opacity-70"
          >
            {tag}
          </span>
        ))}
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm font-bold uppercase tracking-wider underline underline-offset-4 decoration-2"
        >
          View &rarr;
        </a>
      )}
    </div>
  );
}
