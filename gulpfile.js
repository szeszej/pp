var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function() {
  return gulp.src('styles/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('styles'))
});

gulp.task('watch', function() {
  gulp.watch('styles/*.scss', function() {
    return gulp.src('styles/*.scss')
      .pipe(sass())
      .pipe(gulp.dest('styles'))
  });
});
