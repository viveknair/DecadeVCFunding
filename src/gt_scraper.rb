require 'csv'
require 'mongo'

csv_value = IO.binread(ARGV[0])
value = CSV.parse(csv_value)

week_indicator = false
date_indicator = true 

mongo_connection = Mongo::Connection.new
database = mongo_connection['google_trends']
coll = database['initial_collection']

value.each do |key, value|
  key = key.strip if not key.nil?
  value = value.strip if not value.nil?

  # fugly I know
  if week_indicator and date_indicator and not key.nil? and not value.nil? and not key.empty? and not value.empty?
    coll.insert({ "week" => key, "gindex" =>  value })
  end

  week_indicator = true if key == "Week"

  date_indicator = false if (key.nil? or key.length == 0) and week_indicator
end
