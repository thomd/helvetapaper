require "rubygems"
require "rake"
require "Mustache"
require "yaml"

CONFIG = YAML::load_file("history.yml")

class Helvetapaper < Mustache
  self.template_path = "src"
  self.template_extension = "js"

  attr_accessor :history

  def initialize
    @history = CONFIG["history"].map! { |h| hashify(h) }
  end

  def version
    @history.last['version']
  end

  def date
    @history.last['date']
  end

  def change
    @history.last['description']
  end

  def id
    CONFIG["id"]
  end
  
  def history
    @history
  end

  private

  def hashify(event)
    hash = Hash.new
    if event =~ /^(\d+-\d+-\d+) (\d.\d) (.+)$/
      hash['date'] = $1
      hash['version'] = $2
      hash['description'] = $3
    end
    hash
  end
end



task :default => "generate:helvetapaper"

namespace :generate do
  desc "generate Helvetapaper userscript"
  task :helvetapaper do
    target = File.new(CONFIG["userscript"], "w")
    target.puts Helvetapaper.render
    target.close
  end
end
