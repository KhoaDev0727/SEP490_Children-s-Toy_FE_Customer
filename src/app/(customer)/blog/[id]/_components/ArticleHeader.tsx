import Image from "next/image";

interface ArticleHeaderProps {
  post: {
    date: string;
    title: string;
    heroImage: string;
    isFeatured: boolean;
    author: {
      name: string;
    };
  };
}

export default function ArticleHeader({ post }: ArticleHeaderProps) {
  return (
    <header className="relative z-10 flex flex-col gap-6">
      <h1 className="font-extrabold text-[28px] sm:text-[34px] leading-[1.2] text-[#261812] tracking-tight">{post.title}</h1>

      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border-2 border-[#f3cbb9] shadow-md bg-[#f8fafc]">
        {post.isFeatured && (
          <span className="absolute left-4 top-4 z-10 inline-flex rounded-full bg-[#ffeae1] px-3 py-1 text-xs font-bold text-[#ff6a00]">
            Featured
          </span>
        )}
        <Image
          src={post.heroImage}
          alt={post.title}
          fill
          unoptimized
          className="object-contain object-center"
        />
      </div>

      <div className="flex flex-col items-start gap-1 text-left">
        <span className="text-base font-semibold text-[#261812]">Author: {post.author.name}</span>
        <span className="text-sm text-[#8e7164]">PostDate: {post.date}</span>
      </div>
    </header>
  );
}
