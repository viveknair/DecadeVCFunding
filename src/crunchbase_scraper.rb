require 'json'
require 'mongo'
require 'pp'
require 'net/http'
require 'progressbar'


def scrape_crunchbase_funding(path_to_companies)
  # Handle reading of JSON
  raw_json = IO.binread(path_to_companies)
  parsed_json = JSON.parse(raw_json)

  # Mongo connection
  mongo_connection = Mongo::Connection.new
  database = mongo_connection['crunchbase_database']
  coll = database['initial_collection']
  
  pp "Size of companies is #{parsed_json.size}"
  pbar = ProgressBar.new("Scraping Count", 102000)
  
  parsed_json.each_with_index do |company, index|
    uri = URI("http://api.crunchbase.com/v/1/company/#{company['permalink']}.js'")

    begin
      response = Net::HTTP.get(uri)
    rescue Timeout::Error, Errno::EINVAL, Errno::ECONNRESET, EOFError,
           Net::HTTPBadResponse, Net::HTTPHeaderSyntaxError, Net::ProtocolError => e
      p "The thing fucking fucked up. Idk..."
    end
    parsed_response = JSON.parse(response)
    company['total_money_raised'] = parsed_response['total_money_raised']

    funded_years = []
    raised_amounts = []

    parsed_response['funding_rounds'].each do |round|
      funded_years.push(round['funded_year'])
      raised_amounts.push(round['raised_amount'])
    end
    company['funding_years'] = funded_years
    company['raised_amount'] = raised_amounts


    coll.insert(company)

    pbar.inc

    # break if  index >= 100
  end

  pbar.finish
end

scrape_crunchbase_funding("../data/companies.json")
