const fs = require("fs");

let file = "src/components/story-page.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  /<motion\.p[\s\S]*?className="mt-4 text-\[20px\] text-\[#F0EDE8\]\/65">\s*<\/motion\.p>/g,
  "",
);

fs.writeFileSync(file, content, "utf8");
