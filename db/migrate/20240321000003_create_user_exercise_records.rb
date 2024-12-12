class CreateUserExerciseRecords < ActiveRecord::Migration[6.1]
  def change
    create_table :user_exercise_records do |t|
      t.references :user, null: false, foreign_key: true
      t.references :exercise, null: false, foreign_key: true
      t.boolean :is_correct
      t.text :user_answer
      t.integer :attempt_time # 以秒为单位
      t.timestamps
    end
  end
end 