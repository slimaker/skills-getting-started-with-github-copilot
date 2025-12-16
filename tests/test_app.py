import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert "Mergington High School" in response.text


def test_activities_endpoint():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)