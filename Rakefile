require "rubygems"
require "rake"
require "Mustache"
require "yaml"
require "lib/helvetapaper.rb"

CONFIG = YAML::load_file("history.yml")

task :default => "userscript:helvetapaper"

namespace :userscript do
  desc "generate Helvetapaper userscript"
  task :helvetapaper do
    target = File.new(CONFIG["userscript"], "w")
    target.puts Helvetapaper.render
    target.close
  end

  desc "Check javascript with JSLint"
  task :jslint do
    failed_files = []
    classpath = File.join(File.dirname(__FILE__), "lib", "js.jar")
    jslint_path = File.join("lib", "jslint.js")
    Dir['src/*.js'].each do |fname|
      cmd = "java -cp #{classpath} org.mozilla.javascript.tools.shell.Main #{jslint_path} #{fname}"
      results = %x{#{cmd}}
      unless results =~ /^jslint: No problems found in/
        puts "#{fname}:"
        puts results
        failed_files << fname
      end
    end
    if failed_files.size > 0
      exit 1
    end
  end
end
