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
const  webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del")

//Del
const clean = () => {
  return del("build");
}
exports.clean = clean;

//Copy
const copy = () => {
  return gulpfile.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/css/**",
    "source/*.html"
  ], {
    base: "source"
  })
    .pipe(gulpfile.dest("build"));
}
exports.copy = copy;

// Styles
const styles = () => {
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
exports.styles = styles;

//Svg-store
const sprite = () => {
  return gulpfile.src("build/img/**/sprite_*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulpfile.dest("build/img"))
}
exports.sprite = sprite;

// Imagemin
const  imagesOptimization = () => {
  return gulpfile.src("source/img/**/*.{ipg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({ progressive: true }),
      imagemin.svgo()
    ]))
    .pipe(gulpfile.dest("build/img"))
}
exports.imagesOptimization = imagesOptimization;

//Webp
const webpCreation = () => {
  return gulpfile.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulpfile.dest("build/img"))
}
exports.webpCreation = webpCreation;

//Build
const build = gulpfile.series (
  clean,
  copy,
  styles,
  sprite,
  imagesOptimization,
  webpCreation,
);
exports.build = build;

// Server
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

// Watcher
const watcher = () => {
  gulpfile.watch("source/sass/**/*.scss", gulpfile.series("styles"));
  gulpfile.watch("source/*.html").on("change", sync.reload);
}
exports.default = gulpfile.series(
  server
);
