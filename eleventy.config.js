export default function (eleventyConfig) {
  // 이미지·정적 자산은 그대로 _site로 복사 (Tailwind가 만드는 css는 별도 파이프라인)
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });

  // 템플릿/데이터가 바뀌면 브라우저 리로드
  eleventyConfig.addWatchTarget("src/css/");

  return {
    pathPrefix: "/dev-hitop/",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    // .njk를 기본 템플릿 엔진으로
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "html", "md"],
  };
}
