interface BlogPostCardProps {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  url: string;
}

export default function BlogPostCard({
  title,
  date,
  excerpt,
  tags,
  url,
}: BlogPostCardProps) {
  return (
    <a href={url} className="block">
      <article className="blog-card border-3 border-base-content rounded-none overflow-hidden hover:border-primary transition-colors">
        <div className="flex flex-wrap items-center gap-2 px-5 py-3">
          <time className="text-xs font-bold uppercase tracking-wider opacity-50">
            {date}
          </time>
          <span className="opacity-30">|</span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-bold uppercase tracking-wider text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="px-5 py-4 blog-card-body">
          <h2 className="text-lg font-black uppercase tracking-wide">{title}</h2>
          <p className="text-sm mt-2 opacity-70 leading-relaxed">{excerpt}</p>
        </div>
      </article>
    </a>
  );
}
