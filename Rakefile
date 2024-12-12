require 'active_record'
require 'yaml'
require 'sqlite3'
require 'logger'

namespace :db do
  db_config = YAML.load_file('config/database.yml')
  
  ActiveRecord::Base.logger = Logger.new(STDOUT)
  
  desc "创建数据库"
  task :create do
    ActiveRecord::Base.establish_connection(
      adapter: db_config['development']['adapter'],
      database: db_config['development']['database']
    )
    puts "数据库已创建"
  end

  desc "运行数据库迁移"
  task :migrate do
    ActiveRecord::Base.establish_connection(db_config['development'])
    
    migrate_dir = File.join(ActiveRecord::Migrator.migrations_paths)
    Dir.mkdir('db') unless Dir.exist?('db')
    Dir.mkdir(migrate_dir) unless Dir.exist?(migrate_dir)
    
    migration_context = ActiveRecord::MigrationContext.new(migrate_dir)
    migration_context.migrate
    
    puts "数据库迁移完成"
  end
end 