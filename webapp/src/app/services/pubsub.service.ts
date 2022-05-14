import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PubsubService {
  project_id = "test-project"
  host = "http://localhost:8681"
  constructor(private http: HttpClient) { }

  listTopics() {
    return this.http.get<{ topics: Topic[] }>(`${this.host}/v1/projects/${this.project_id}/topics`).pipe(map(incoming => incoming.topics))
  }
  listSubscriptionsOnTopic(topicPath: string) {
    console.log('looking up subscriptions on', topicPath)
    const url = `${this.host}/v1/${topicPath}/subscriptions`
    console.log('request url', url)
    return this.http.get<{ subscriptions: string[] }>(url).pipe(map(incoming => incoming.subscriptions))
  }
  listSubscriptions() {
    return this.http.get<{ subscriptions: Subscription[] }>(`${this.host}/v1/projects/${this.project_id}/subscriptions`).pipe(map(incoming => incoming.subscriptions))
  }

  fetchMessages(subPath: string, maxMessages: number) {
    return this.http
      .post<{ receivedMessages: ReceivedMessage[] }>(
        `${this.host}/v1/${subPath}:pull`,
        { returnImmediately: true, maxMessages }
      ).pipe(map(incoming => incoming.receivedMessages ?? []))
  }
}

export interface Topic {
  name: string
  labels: { [key: string]: string }
  subscriptions?: string[]
}

export interface Subscription {
  name: string
  topic: string
}

export interface ReceivedMessage {
  ackId: string
  message: PubsubMessage
  deliveryAttempt: number
}

export interface PubsubMessage {
  data: string
  attributes: { [key: string]: string }
  messageId: string
  publishTime: string
  orderingKey: string
}