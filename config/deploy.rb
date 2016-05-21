# config valid only for current version of Capistrano
lock '3.4.0'

set :application, 'sook'
set :repo_url, 'git@github.com:iamdoo2/sook.git'
set :repo_url, 'https://github.com/iamdoo2/sook.git'
set :passenger_restart_with_touch, true
set :delayed_job_roles, :all
set :deploy_to, "/home/ec2-user/#{fetch(:application)}"

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
set :rvm_ruby_version, '2.2.4'

# Default value for :scm is :git
set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
# set :log_level, :debug

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
# set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/secrets.yml')
set :linked_files, fetch(:linked_files, []).push('config/application.yml')

# Default value for linked_dirs is []
# set :linked_dirs, fetch(:linked_dirs, []).push('log', 'tmp/pids', 'tmp/cache', 'tmp/sockets', 'vendor/bundle', 'public/system')
set :linked_dirs, fetch(:linked_dirs, []).push('log', 'tmp')

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
set :keep_releases, 5
set :passenger_roles, :all
set :rails_env, :production

namespace :deploy do

  after :restart, :clear_cache do
    on roles(:api), in: :groups, limit: 3, wait: 10 do
      # Here we can do anything such as:
      # within release_path do
      #   execute :rake, 'cache:clear'
      # end
    end
  end

  task :reset_db do  
    on roles(:api), in: :groups, limit: 3, wait: 10 do
      within release_path do  
        with rails_env: fetch(:rails_env) do
          execute :rake, "db:drop"
          execute :rake, "db:create"
          execute :rake, "db:migrate"
        end 
      end 
    end 
  end 
end
