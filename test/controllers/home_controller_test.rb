require 'test_helper'

class HomeControllerTest < ActionController::TestCase
  test "should get map" do
    get :map
    assert_response :success
  end

  test "should get bubble" do
    get :bubble
    assert_response :success
  end

  test "should get ranking" do
    get :ranking
    assert_response :success
  end

end
