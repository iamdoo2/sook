class Ranking < ActiveRecord::Base

  def as_json options={}
      {
        id: self.id,
        ranker_name: self.username,
        elapsed_time: time_converting(self.elapsedtime),
        created_at: self.created_at.strftime("%m/%d %I:%M %p")
      }
  end

  def time_converting sec
    Time.at(sec/1000.0).utc.strftime("%M:%S.%L")
  end

end
