function() {
  emit({category_code: this.category_code, funded_year : this.funded_year, vc_firm : this.vc_name}, 
       { total_amount: this.raised_amount, number_funding_rounds: 1 })
}
