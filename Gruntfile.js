/*global module:false*/
module.exports = function(grunt) {

  var meta = {
    banner: '/*\n  <%= pkg.title || pkg.name %> <%= pkg.version %>' +
      '<%= pkg.homepage ? " <" + pkg.homepage + ">" : "" %>' + '\n' +
      '  Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>' +
      '\n\n  Released under <%= _.pluck(pkg.licenses, "type").join(", ") %> License\n*/',
    pre: '\n(function(window, document){\n\n',
    post: '\n})(window,document);'
  };

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: ["build"],
    
    shell: {
        buildHtml2canvas: {
            command: 'grunt --gruntfile ./html2canvas/Gruntfile.js'
        }
    },
    
    concat: {
      anigif: {
        src: [
          'src/*.js',
          'html2canvas/build/html2canvas.js',
          'node_modules/async/lib/async.js'
        ],
        dest: 'build/<%= pkg.name %>.js'
      },
      gifgenerator: {
        src: [
          'jsgif/LZWEncoder.js',
          'jsgif/NeuQuant.js',
          'jsgif/GIFEncoder.js',
        ],
        dest: 'build/gif-generator.js'
      },
      options:{
        banner: meta.banner + meta.pre,
        footer: meta.post
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, flatten: true, src: ['test/*'], dest: 'build/', filter: 'isFile'}
        ]
      }
    },

    uglify: {
      dist: {
        src: ['<%= concat.dist.dest %>'],
        dest: 'build/<%= pkg.name %>.min.js'
      },
      options: {
        banner: meta.banner
      }
    },
    jshint: {
      all: ['src/*.js', 'html2canvas/build/html2canvas.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        devel: true,
        globals: {
          jQuery: true
        }
      }
    },
    
    watch: {
      files: ['<%= concat.anigif.src %>', 'test/*'],
      tasks: ['default']
    },
    simplemocha: {
        options: {
          globals: ['should'],
          timeout: 30000,
          ignoreLeaks: false,
          ui: 'bdd',
          reporter: 'tap'
        },
    
        all: { src: ['test/**/*.js'] }
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('full', ['clean', 'shell:buildHtml2canvas', 'jshint', 'copy', 'concat', 'uglify', 'simplemocha']);
  grunt.registerTask('test', ['copy', 'concat', 'simplemocha']);
  grunt.registerTask('default', ['copy', 'concat']);
  
  

};
