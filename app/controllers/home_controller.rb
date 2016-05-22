class HomeController < ApplicationController
  def map
  end

  def bubble
    render layout: false
  end

  def ranking
    @ranks = Ranking.order("elapsedtime asc").first(5)
    render json: @ranks
  end

  def submit_rank
    r = Ranking.new
    r.username = params[:ranker_name]
    r.elapsedtime = params[:elapsed_time]
    r.save
    rank = Ranking.order("elapsedtime asc").map{|x| x.id}.index(r.id) + 1
    render :text => rank
  end
end
