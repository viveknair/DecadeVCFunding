function() {
  emit({category_code: this.category_code, funded_year : this.funded_year}, 
       { count: this.raised_amount})
}
