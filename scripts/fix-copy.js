const fs = require("fs");

const filesToUpdate = [
  "src/components/landing/sixstreet-landing.tsx",
  "src/components/landing/qutb-landing.tsx",
  "src/components/story-page.tsx",
  "src/lib/auth-email.ts",
  "src/lib/products.ts",
];

filesToUpdate.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  content = content.replace(
    /We are the axis\. The fixed point\. Everything revolves - we stay still\./g,
    "ERA 99. Not a trend. A position.",
  );

  content = content.replace(
    /ERA 99 started with a conversation between a father and his\s+son\. One who had spent over fifteen years inside Egyptian\s+factories — managing production, building relationships,\s+understanding fabric from the thread up\. One who saw what that\s+knowledge could become if it was pointed at something of our\s+own\./g,
    "ERA 99 began with a conversation. A father. 15 years in Egyptian factories. A son. One question: why not ours? This is the era.",
  );

  if (file.includes("auth-email.ts")) {
    content = content.replace(
      /<p>This link expires in 24 hours\.<\/p>/,
      '<p>This link expires in 24 hours.</p>\n        <p style="margin-top: 30px; font-size: 12px; color: #666;">ERA 99 &middot; Alexandria, Egypt &middot; The axis holds.</p>',
    );

    content = content.replace(
      /<p>This link expires in 1 hour\.<\/p>/,
      '<p>This link expires in 1 hour.</p>\n        <p style="margin-top: 30px; font-size: 12px; color: #666;">ERA 99 &middot; Alexandria, Egypt &middot; The axis holds.</p>',
    );
  }

  if (file.includes("products.ts")) {
    content = content.replace(
      /fabric:\s*"[^"]+",?/g,
      'fabric: "220 GSM. Boxy. Built in Alexandria. This is the era.",',
    );
    content = content.replace(
      /fit:\s*"[^"]+",?/g,
      'fit: "220 GSM. Boxy. Built in Alexandria. This is the era.",',
    );
    content = content.replace(
      /care:\s*"[^"]+",?/g,
      'care: "220 GSM. Boxy. Built in Alexandria. This is the era.",',
    );

    content = content.replace(/6street-/g, "era99-");
    content = content.replace(/6street/g, "era99");
  }

  fs.writeFileSync(file, content, "utf8");
});
console.log("Fixed multiline structural texts");
