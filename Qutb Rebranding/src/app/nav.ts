export type Page = "home" | "collection" | "product" | "journey" | "salt" | "cart" | "alex" | "manufacturing" | "philosophy" | "packaging" | "sustainability" | "wholesale" | "contact" | "signin" | "register" | "early";

export function navigate(to: Page) {
  if (to === "collection") window.location.hash = "collection";
  else if (to === "product") window.location.hash = "product";
  else if (to === "journey") window.location.hash = "journey";
  else if (to === "salt") window.location.hash = "salt";
  else if (to === "cart") window.location.hash = "cart";
  else if (to === "alex") window.location.hash = "alex";
  else if (to === "manufacturing") window.location.hash = "manufacturing";
  else if (to === "philosophy") window.location.hash = "philosophy";
  else if (to === "packaging") window.location.hash = "packaging";
  else if (to === "sustainability") window.location.hash = "sustainability";
  else if (to === "wholesale") window.location.hash = "wholesale";
  else if (to === "contact") window.location.hash = "contact";
  else if (to === "signin") window.location.hash = "signin";
  else if (to === "register") window.location.hash = "register";
  else if (to === "early") window.location.hash = "early";
  else window.location.hash = "";
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}
