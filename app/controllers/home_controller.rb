class HomeController < ApplicationController
  def map
  end

  def bubble
    render layout: false
  end

  def ranking
    @ranks = Ranking.all
  end

  def submit_rank
    render :text => 3
  end
end
