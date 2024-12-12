require 'active_record'
require_relative 'models/user'
require_relative 'models/exercise'
require_relative 'models/user_exercise_record'

# 连接数据库
db_config = YAML.load_file('config/database.yml')
ActiveRecord::Base.establish_connection(db_config['development'])

# 创建用户
user = User.create(
  username: "张三",
  email: "zhangsan@example.com",
  age: 18
)

# 创建练习题
exercise = Exercise.create(
  title: "数学题1",
  content: "1 + 1 = ?",
  difficulty: "简单"
)

# 记录用户做题
record = UserExerciseRecord.create(
  user: user,
  exercise: exercise,
  is_correct: true,
  user_answer: "2",
  attempt_time: 30
)

# 查询用户的做题记录
user.user_exercise_records.each do |record|
  puts "题目：#{record.exercise.title}"
  puts "答案：#{record.user_answer}"
  puts "是否正确：#{record.is_correct}"
  puts "用时：#{record.attempt_time}秒"
end 