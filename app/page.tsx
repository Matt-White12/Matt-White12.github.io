import HeroSection from "@/components/HeroSection";
import ProjectCard from "@/components/ProjectCard";
import BlogPostCard from "@/components/BlogPostCard";

const projects = [
  {
    title: "Pepsi World Index",
    description:
      "Data pipeline testing if the world was better when Pepsi was king. Python + dbt + DuckDB pipeline with interactive Recharts dashboard.",
    tags: ["Python", "dbt", "DuckDB", "Recharts"],
    url: "/projects/pepsi-world-index",
  },
  {
    title: "Project Placeholder 2",
    description: "Project placeholder description",
    tags: ["JavaScript", "Algorithms"],
    url: "https://codepen.io",
  },
  {
    title: "Project Placeholder 3",
    description: "Project placeholder description",
    tags: ["JavaScript", "UI"],
    url: "https://codepen.io",
  },
];

const posts = [
  {
    title: "Data Engineering with WoW",
    date: "Feb 14, 2026",
    excerpt:
      "A placeholder blog post about setting up a Next.js project and deploying it to GitHub Pages.",
    tags: ["Next.js", "React"],
    slug: "getting-started-nextjs",
  },
];

export default function Home() {
  return (
    <>
      <HeroSection />

      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-0">
          {/* Blog - left */}
          <div
            id="blog"
            className="lg:w-1/2 border-3 border-base-content p-8 scroll-mt-16 bg-base-100"
          >
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1">
              Section 01
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-6">
              Blog
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {posts.map((post) => (
                <BlogPostCard key={post.slug} {...post} />
              ))}
            </div>
          </div>

          {/* Projects - right */}
          <div
            id="projects"
            className="lg:w-1/2 border-3 border-base-content border-t-0 lg:border-t-3 lg:border-l-0 p-8 scroll-mt-16 bg-base-100"
          >
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1">
              Section 02
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-6">
              Projects
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.title} {...project} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
