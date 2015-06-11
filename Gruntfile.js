module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      lib: {
        src: [
             'public/lib/jquery.js',
             'public/lib/underscore.js',
             'public/lib/backbone.js',
             'public/lib/handlebars.js',
             ],
        dest: 'public/dist/lib.js'
      },
      built: {
        src: 'public/client/*.js',
        dest: 'public/dist/built.js',
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      my_target: {
        files: {
          'public/dist/built.min.js': 'public/dist/built.js',
          'public/dist/lib.min.js': 'public/dist/lib.js'
        }
      }
    },

    jshint: {


      files: [
        './**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js',
          'node_modules/**/*.js'
        ]
      }
    },

    cssmin: {
      target: {
        files: {
          'public/dist/style.min.css' : 'public/style.css'
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'app/**/*.js',
          'lib/*.js',
          './*.js',
          '/test/*.js'

        ],
        tasks: [
          'deploy'
        ]
      },
      css: {
        files: [
                 'public/*.css',
                 '!public/dist/*.css'
                ],
        tasks: ['deploy']
      }
    },

    shell: {
      prodServer: {
        command: ['git commit -a -m "Grunt pushing to production server."',
                  'git push azure master'
                  ].join('&&')
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'jshint',
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'test',
    'concat',
    'uglify',
    'cssmin'
  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      grunt.task.run(['shell:prodServer']);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
    'build',
    'upload'
  ]);


};
