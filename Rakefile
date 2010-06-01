require "rubygems"
require "rake"

SRC = FileList['src/helvetapaper.js', 'src/updater.js']
TARGET = 'helvetapaper.user.js'

task :default => TARGET

file TARGET => SRC do
  sh "cat #{SRC} > #{TARGET}"
end

