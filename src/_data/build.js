export default function () {
  return {
    siteUrl: (process.env.SITE_URL || "https://iks.zrc-sazu.si").replace(/\/$/, ""),
    pathPrefix: process.env.PATH_PREFIX || "/"
  };
}
