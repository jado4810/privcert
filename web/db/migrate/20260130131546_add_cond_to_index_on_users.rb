class AddCondToIndexOnUsers < ActiveRecord::Migration[8.1]
  def change
    remove_index :users, column: :name, unique: true
    add_index :users, :name, unique: true, where: 'invalid_flag = false'
  end
end
