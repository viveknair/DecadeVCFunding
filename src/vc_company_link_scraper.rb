require 'mongo'
require 'json'
require 'net/http'

mconn = Mongo::Connection.new
data = mconn['crunchbase_database']
coll = data['fourth_collection']

raw_information = IO.binread('../data/json/bc.json')
parsed_json = JSON.parse(raw_information)

parsed_json['investments'].each do |funding_round|
  funding_round = funding_round['funding_round']
  company = funding_round['company']
  permalink = company['permalink']
  uri = URI("http://api.crunchbase.com/v/1/company/#{permalink}.js")  
  response = ""
  begin
    response = Net::HTTP.get(uri)
  rescue
    p "fucked up"
  end

  parsed_company_response = JSON.parse(response)  
  category_code = parsed_company_response['category_code']


  # Right before insertion
  new_entry = {}
  new_entry['vc_name'] = parsed_json['name']
  new_entry['raised_amount'] = funding_round['raised_amount']
  new_entry['funded_year']  = funding_round['funded_year']
  
  new_entry['category_code'] = category_code
  
  coll.insert(new_entry)  
end
