const pkgjson = require('./package.json')

const config = {
  pkg: pkgjson,
  src: 'src',
  dist: 'dist',
  name: pkgjson.name
}

module.exports = function (grunt) {
  grunt.initConfig({
    config: config,
    pkg: config.pkg,
    eslint: {
      target: '<%= config.src %>/js/**/*.js'
    },
    modernizr: {
      dist: {
        'parseFiles': true,
        'customTests': [],
        'dest': '<%= config.dist %>/js/modernizr.min.js',
        'options': [
          'setClasses'
        ],
        'uglify': true
      }
    },
    sass: {
      dev: {
        options: {
          sourceMap: false,
          outputStyle: 'expanded',
          precision: 5
        },
        files: {
          '<%= config.dist %>/css/<%= pkg.name %>.css': '<%= config.src %>/scss/main.scss'
        }
      },
      dist: {
        options: {
          sourceMap: true,
          outputStyle: 'compressed',
          precision: 2
        },
        files: {
          '<%= config.dist %>/css/<%= pkg.name %>.min.css': '<%= config.src %>/scss/main.scss'
        }
      }
    },
    autoprefixer: {
      dist: {
        files: {
          '<%= config.dist %>/css/<%= pkg.name %>.min.css':'<%= config.dist %>/css/<%= pkg.name %>.min.css'
        }
      }
    },
    browserify: {
      dist: {
        src: [
          '<%= config.src %>/js/**/*.js'
        ],
        dest: '<%= config.dist %>/js/<%= pkg.name %>.js',
        options: {
          browserifyOptions: {
            debug: true
          },
          watch: false,
          keepAlive: false,
          transform: [['babelify', { 'presets': ['es2015'] }]]
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: {
          '<%= config.dist %>/js/<%= pkg.name %>.min.js': '<%= config.dist %>/js/<%= pkg.name %>.js'
        }
      }
    },
    watch: {
      css: {
        files: ['<%= config.src %>/scss/**/*.scss'],
        tasks: ['sass', 'autoprefixer']
      },
      js: {
        files: ['<%= config.src %>/js/**/*.js'],
        tasks: ['eslint', 'browserify', 'uglify']
      }
    }
  })

  grunt.loadNpmTasks('grunt-sass')
  grunt.loadNpmTasks('grunt-autoprefixer')
  grunt.loadNpmTasks('grunt-eslint')
  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-modernizr')

  grunt.registerTask('build', ['modernizr', 'eslint', 'browserify', 'uglify', 'sass', 'autoprefixer'])
  grunt.registerTask('default', ['build', 'watch'])
}