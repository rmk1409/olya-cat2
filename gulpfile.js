const gulpfile = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del")

const cleanBuildFolder = () => {
  return del("build");
};

const copyFontsAndImagesToBuild = () => {
  return gulpfile.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
  ], {
    base: "source"
  })
    .pipe(gulpfile.dest("build"));
}

const copyHtmlToBuild = () => {
  return gulpfile.src([
    "source/*.html"
  ], {
    base: "source"
  })
    .pipe(gulpfile.dest("build"));
}

const copyCssToBuild = () => {
  return gulpfile.src([
    "source/css/**"
  ], {
    base: "source"
  })
    .pipe(gulpfile.dest("build"));
}

const copyJsToBuild = () => {
  return gulpfile.src([
    "source/js/**"
  ], {
    base: "source"
  })
    .pipe(gulpfile.dest("build"));
}


const makeCssFromSass = () => {
  return gulpfile.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulpfile.dest("source/css"))
    .pipe(sync.stream());
}

const makeMinifiedCssFromSass = () => {
  return gulpfile.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulpfile.dest("build/css"))
    .pipe(sync.stream());
}

const makeSvgSprite = () => {
  return gulpfile.src("build/img/**/sprite_*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulpfile.dest("build/img"))
}

const optimizeImages = () => {
  return gulpfile.src("source/img/**/*.{ipg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 1}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulpfile.dest("build/img"))
}

const createWebp = () => {
  return gulpfile.src("build/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulpfile.dest("build/img"))
}

const build = gulpfile.series(
  cleanBuildFolder,
  copyFontsAndImagesToBuild,
  copyHtmlToBuild,
  copyCssToBuild,
  copyJsToBuild,
  makeCssFromSass,
  makeMinifiedCssFromSass,
  optimizeImages,
  makeSvgSprite,
  createWebp
);
exports.build = build;

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}
exports.server = server;

const watcher = () => {
  gulpfile.watch("source/sass/**/*.scss", gulpfile.series(makeCssFromSass, copyCssToBuild, makeMinifiedCssFromSass));
  gulpfile.watch("source/js/**/*.js", gulpfile.series(copyJsToBuild));
  gulpfile.watch("source/*.html", gulpfile.series(copyHtmlToBuild));
  gulpfile.watch("build/**/*.*").on("change", sync.reload);
}
exports.default = gulpfile.series(build, server, watcher);
