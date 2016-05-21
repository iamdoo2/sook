class CreateRankings < ActiveRecord::Migration
  def change
    create_table :rankings do |t|

      t.timestamps null: false
    end
  end
end
