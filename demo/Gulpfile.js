var gulp = require('gulp'),
    include = require('gulp-include');
gulp.task('default',function(){
  gulp.src('*.html')
      .pipe(include({
        baseUrl:"sinclude/"
      }))
      .pipe(gulp.dest('dest/'));
});
