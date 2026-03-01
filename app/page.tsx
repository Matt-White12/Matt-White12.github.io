import HeroSection from "@/components/HeroSection";
import BlogPostCard from "@/components/BlogPostCard";

const posts = [
  {
    title: "Was the World Better When Pepsi Was King?",
    date: "Feb 27, 2026",
    excerpt:
      "A data engineering project correlating Pepsi vs Coca-Cola search popularity with world quality metrics. Inspired by a podcast claim that we are the coolest when Pepsi and Burger King are the driving force in society.",
    tags: ["Python", "dbt", "DuckDB", "Recharts"],
    url: "/projects/pepsi-world-index",
  },
];

export default function Home() {
  return (
    <>
      <HeroSection />

      <section className="px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div
            id="blog"
            className="border-3 border-base-content p-8 scroll-mt-16 bg-base-100"
          >
            <p className="text-xs font-mono uppercase tracking-[0.3em] opacity-40 mb-1">
              Section 01
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-6">
              Blog
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {posts.map((post) => (
                <BlogPostCard key={post.url} {...post} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
