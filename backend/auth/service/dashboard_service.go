package service

import (
	"fmt"
	"github.com/rishik92/velox/auth/repository"
)

type DashboardService struct {
	repo *repository.UserRepository
}

func NewDashboardService(repo *repository.UserRepository) *DashboardService {
	return &DashboardService{repo: repo}
}

type DashboardData struct {
	UserID    string `json:"user_id"`
	UserName  string `json:"user_name"`
	UserEmail string `json:"user_email"`
	Message   string `json:"message"`
}

func (s *DashboardService) GetUserData(userID string) (*DashboardData, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, err
	}

	return &DashboardData{
		UserID:    user.ID,
		UserName:  user.Name,
		UserEmail: user.Email,
		Message:   fmt.Sprintf("Welcome back, %s!", user.Name),
	}, nil
}
