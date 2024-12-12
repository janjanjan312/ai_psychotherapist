class User < ActiveRecord::Base
  has_many :user_exercise_records
  has_many :exercises, through: :user_exercise_records

  validates :username, presence: true
  validates :email, presence: true, uniqueness: true
  validates :age, numericality: { greater_than: 0 }, allow_nil: true
end 